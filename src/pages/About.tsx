import { PageHeader } from "@/components/PageHeader";

const About = () => {
  return (
    <div className="min-h-screen pb-16">
      <PageHeader title="ஆசிரியர் & நூல்" back="/" />
      <main className="container max-w-2xl px-4 mt-6 space-y-6">
        <section className="paper-card rounded-lg p-6">
          <h2 className="font-serif text-2xl text-primary text-center">ஜெயமோகன்</h2>
          <div className="ornament-divider my-3"><span className="text-xs">❖</span></div>
          <p className="font-serif text-foreground/90 leading-loose">
            ஜெயமோகன் தமிழின் முக்கியமான சமகால எழுத்தாளர்களில் ஒருவர். கதை, நாவல்,
            கட்டுரை, விமர்சனம் என பல தளங்களில் பணியாற்றியவர். அவருடைய எழுத்துகள்
            இந்திய தரிசனம், மானுட உளவியல், பாரம்பரிய மதிப்பீடுகள் ஆகியவற்றை ஆழமாக
            ஆராய்கின்றன.
          </p>
        </section>

        <section className="paper-card rounded-lg p-6">
          <h2 className="font-serif text-2xl text-primary text-center">வெண்முரசு</h2>
          <div className="ornament-divider my-3"><span className="text-xs">❖</span></div>
          <p className="font-serif text-foreground/90 leading-loose">
            வெண்முரசு என்பது மகாபாரதத்தை தமிழில் மறுபடைப்பு செய்த ஜெயமோகனின் மாபெரும்
            நாவல் தொடர். பத்தாண்டுகள் கடும் உழைப்பில் எழுதப்பட்ட இந்த தொடர் 26 நூல்களைக்
            கொண்டது; கதை, தத்துவம், கலை, அரசியல், மானுடம் என எல்லா தளங்களையும் தொடுகிறது.
          </p>
          <p className="font-serif text-foreground/90 leading-loose mt-3">
            இது ஒரு வாசிப்பு துணை செயலி — அத்தியாயங்கள், உறவுகள், கலைச்சொற்கள், வரைபடம்
            ஆகியவற்றை எளிதாக நினைவில் கொள்ள உதவும்.
          </p>
        </section>
      </main>
    </div>
  );
};

export default About;
