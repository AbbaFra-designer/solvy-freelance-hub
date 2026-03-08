import { User, Calendar, Package } from "lucide-react";

const ProfilePage = () => {
  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold text-foreground">Profilo</h1>
        <p className="text-muted-foreground text-sm mt-1">Il tuo account Solvy</p>
      </div>

      {/* Avatar + Info */}
      <div className="flex flex-col sm:flex-row items-start gap-6">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center shrink-0">
          <User className="w-8 h-8 text-muted-foreground" />
        </div>
        <div className="space-y-4 flex-1 w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FieldDisplay label="Nome" value="Marco Rossi" />
            <FieldDisplay label="Email" value="marco@solvy.io" />
            <FieldDisplay label="Partita IVA" value="IT12345678901" />
            <FieldDisplay label="Tipo attività" value="Freelancer — Design" />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-secondary/50 flex items-center gap-3">
          <Calendar className="w-5 h-5 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Membro dal</p>
            <p className="text-sm font-medium text-foreground">Gen 2025</p>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-secondary/50 flex items-center gap-3">
          <Package className="w-5 h-5 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">App attive</p>
            <p className="text-sm font-medium text-foreground">3</p>
          </div>
        </div>
      </div>

      <button className="gradient-accent px-8 py-3 rounded-lg font-medium text-sm text-foreground hover:opacity-90 transition-opacity">
        Modifica profilo
      </button>
    </div>
  );
};

function FieldDisplay({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

export default ProfilePage;
