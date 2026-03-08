import { createClient } from "https://esm.sh/@supabase/supabase-js@2.98.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const results: any[] = [];

    // Create admin user
    const { data: adminUser, error: adminError } =
      await supabaseAdmin.auth.admin.createUser({
        email: "admin@solvy.io",
        password: "Admin2026!",
        email_confirm: true,
      });

    if (adminError && !adminError.message.includes("already been registered")) {
      throw adminError;
    }

    const adminId = adminUser?.user?.id;
    if (adminId) {
      // Set admin role
      await supabaseAdmin
        .from("user_roles")
        .upsert({ user_id: adminId, role: "admin" }, { onConflict: "user_id,role" });

      // Update admin profile
      await supabaseAdmin
        .from("profiles")
        .update({
          nome: "Admin",
          cognome: "Solvy",
          email: "admin@solvy.io",
          tipo_attivita: "Amministratore piattaforma",
        })
        .eq("user_id", adminId);

      results.push({ email: "admin@solvy.io", role: "admin", id: adminId });
    }

    // Create freelancer user
    const { data: freelancerUser, error: freelancerError } =
      await supabaseAdmin.auth.admin.createUser({
        email: "freelancer@solvy.io",
        password: "Freelancer2026!",
        email_confirm: true,
      });

    if (freelancerError && !freelancerError.message.includes("already been registered")) {
      throw freelancerError;
    }

    const freelancerId = freelancerUser?.user?.id;
    if (freelancerId) {
      // Set freelancer role
      await supabaseAdmin
        .from("user_roles")
        .upsert({ user_id: freelancerId, role: "freelancer" }, { onConflict: "user_id,role" });

      // Update freelancer profile
      await supabaseAdmin
        .from("profiles")
        .update({
          nome: "Marco",
          cognome: "Rossi",
          email: "freelancer@solvy.io",
          telefono: "+39 333 1234567",
          partita_iva: "IT12345678901",
          codice_fiscale: "RSSMRC90A01H501Z",
          codice_ateco: "62.01.00",
          coefficiente_redditivita: "67%",
          codice_sdi: "3C984HL",
          indirizzo: "Via Roma 42, Milano",
          tipo_attivita: "Freelancer — Design & Dev",
        })
        .eq("user_id", freelancerId);

      results.push({ email: "freelancer@solvy.io", role: "freelancer", id: freelancerId });
    }

    return new Response(JSON.stringify({ success: true, users: results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
