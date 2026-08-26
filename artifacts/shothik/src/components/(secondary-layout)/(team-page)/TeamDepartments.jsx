import { team } from "@/_mock/team";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Briefcase, Cpu, Sparkles } from "lucide-react";
import * as motion from "motion/react-client";

const departments = [
  {
    title: "AI Systems & Core Engineering",
    description:
      "Architecting distributed agent swarms, 5-tier model mesh, Hermes MCP gateway, and generative work surfaces",
    Icon: Cpu,
    teamSize: 1,
    members: ["Ahsan Habib"],
  },
  {
    title: "Operations & Business Strategy",
    description:
      "Operational leadership, commercial growth, merchant scaling, and strategic company execution",
    Icon: Briefcase,
    teamSize: 1,
    members: ["Shafin Ahmed"],
  },
  {
    title: "Strategic Advisory & Ecosystem",
    description:
      "Advisors and partners driving international expansion, governance, and institutional scaling",
    Icon: Sparkles,
    teamSize: 1,
    members: ["Sudip Majumder"],
  },
];

export default function TeamDepartments() {
  return (
    <div className="bg-muted/20 -mx-4 px-4 py-20 sm:-mx-6 sm:px-6 md:-mx-10 md:px-10">
      <div className="container mx-auto">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <Badge className="mb-4 px-4 py-2 text-sm font-medium">
            Core Pillars
          </Badge>
          <h2 className="mb-6 text-3xl font-bold sm:text-4xl lg:text-5xl">
            Our Organization
          </h2>
          <p className="text-muted-foreground mx-auto max-w-3xl text-xl leading-relaxed">
            Focused leadership delivering frontier multi-agent AI for South Asia & Global markets
          </p>
        </motion.div>

        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3 justify-items-center">
          {departments.map((dept, index) => (
            <motion.div
              key={index}
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.1 * (index + 1) }}
              viewport={{ once: true }}
              className="w-full"
            >
              <Card className="bg-card h-full border-0 shadow-md transition-all duration-300 hover:shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="bg-primary/10 mb-4 inline-flex h-14 w-14 items-center justify-center rounded-lg">
                    <dept.Icon className="text-primary h-7 w-7" />
                  </div>
                  <h4 className="mb-2 text-lg font-semibold">{dept.title}</h4>
                  <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
                    {dept.description}
                  </p>
                  <Badge variant="secondary" className="mb-3 text-xs">
                    {dept.teamSize} Member{dept.teamSize > 1 ? "s" : ""}
                  </Badge>
                  <div className="text-muted-foreground text-xs font-medium">
                    {dept.members.join(", ")}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
