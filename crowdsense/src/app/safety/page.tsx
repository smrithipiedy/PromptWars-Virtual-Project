import { Shield, Lock, Eye, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "AI Safety & Privacy Policy",
  description: "How CrowdSense ensures responsible AI development and data privacy.",
};

export default function SafetyPage() {
  const policies = [
    {
      icon: Shield,
      title: "Responsible AI Usage",
      content: "All venue analysis is performed using Google Gemini models with strict safety filters (HARM_CATEGORY_DANGEROUS_CONTENT, etc.) to ensure that AI-generated safety recommendations are ethical and non-biased."
    },
    {
      icon: Lock,
      title: "Data Security",
      content: "Venue floor plans and crowd data are processed securely. We use industry-standard encryption for data at rest and in transit. Your venue data is used solely for safety analysis."
    },
    {
      icon: Eye,
      title: "Privacy by Design",
      content: "CrowdSense prioritizes attendee privacy. Our density analysis uses aggregate data and does not track individual identities, ensuring GDPR and CCPA compliance defaults."
    },
    {
      icon: CheckCircle2,
      title: "Human-in-the-loop",
      content: "While our AI provides high-accuracy safety insights, we recommend all critical safety decisions be reviewed by certified venue inspectors. AI serves as a powerful assistant, not a replacement for professional judgment."
    }
  ];

  return (
    <div className="min-h-screen bg-[#04040a] text-white pt-20 pb-20">
      <div className="max-w-4xl mx-auto px-6">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-black mb-4 gradient-text-white">AI Safety & Privacy</h1>
          <p className="text-text-secondary">Our commitment to responsible AI and secure data handling.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {policies.map((p, i) => (
            <div key={i} className="card p-8 bg-blue-500/[0.02] border-blue-500/10">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6">
                <p.icon className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">{p.title}</h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                {p.content}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-16 p-8 rounded-2xl bg-gradient-to-r from-blue-600/10 to-violet-600/10 border border-blue-500/20 text-center">
          <h2 className="text-2xl font-bold mb-4">Questions about our safety implementation?</h2>
          <p className="text-text-secondary mb-8 max-w-xl mx-auto">
            CrowdSense is built for the PromptWars competition with a focus on 'Security' and 'Responsible AI'. We follow Google's AI Principles.
          </p>
          <a href="mailto:safety@crowdsense.events" className="btn-primary">
            Contact Safety Team
          </a>
        </div>
      </div>
    </div>
  );
}
