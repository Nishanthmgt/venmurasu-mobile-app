import { Link } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";

const NotFound = () => (
  <div className="min-h-screen">
    <PageHeader title="பக்கம் கிடைக்கவில்லை" back="/" />
    <main className="container max-w-md mt-16 text-center px-4">
      <div className="font-serif text-6xl text-primary mb-2">௪௦௪</div>
      <p className="text-muted-foreground font-serif mb-6">நீங்கள் தேடிய பக்கம் இல்லை.</p>
      <Link to="/" className="inline-block px-6 py-2 rounded-full bg-primary text-primary-foreground font-serif text-sm hover:bg-primary/90 transition">
        முகப்புக்கு செல்
      </Link>
    </main>
  </div>
);

export default NotFound;
