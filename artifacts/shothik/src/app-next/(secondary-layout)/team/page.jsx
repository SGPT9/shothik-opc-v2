import TeamCTA from "@/components/(secondary-layout)/(team-page)/TeamCTA";
import TeamCulture from "@/components/(secondary-layout)/(team-page)/TeamCulture";
import TeamDepartments from "@/components/(secondary-layout)/(team-page)/TeamDepartments";
import TeamHero from "@/components/(secondary-layout)/(team-page)/TeamHero";
import TeamLeadership from "@/components/(secondary-layout)/(team-page)/TeamLeadership";

export async function generateMetadata() {
  return {
    title: "Leadership & Team - Shothik AI (SGPT9)",
    description:
      "Meet the leadership team behind Shothik AI. Driving autonomous multi-agent intelligence and enterprise AI operating systems for Emerging Markets.",
  };
}

export default function TeamPage() {
  return (
    <>
      <TeamHero />
      <div className="container mx-auto px-4">
        <TeamLeadership />
        <TeamDepartments />
        <TeamCulture />
        <TeamCTA />
      </div>
    </>
  );
}
