import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Award, Globe, Heart, Rocket, Shield, Zap } from "lucide-react";
import * as motion from "motion/react-client";

const cultureValues = [
  {
    title: "Frontier Innovation",
    description: "Pushing the boundaries of autonomous LLM reasoning and 5-tier model routing.",
    Icon: Rocket,
  },
  {
    title: "Zero-Latency Architecture",
    description: "Optimized for extreme low-memory devices and asynchronous background execution.",
    Icon: Zap,
  },
  {
    title: "Postgres RLS Security",
    description: "Enterprise multi-tenant data isolation with strict tenant policy enforcement.",
    Icon: Shield,
  },
  {
    title: "South Asian Demography Focus",
    description: "Tailored for bKash, Nagad, Banglish NLP, and regional digital merchant commerce.",
    Icon: Globe,
  },
  {
    title: "Customer-Centric Automation",
    description: "Empowering creators, merchants, and students with autonomous AI workflows.",
    Icon: Heart,
  },
  {
    title: "Engineering Excellence",
    description: "Rigorous test-driven microservices, type safety, and real-time observability.",
    Icon: Award,
  },
];

const stats = [
  { value: "3", label: "Core Pillars" },
  { value: "5-Tier", label: "Model Mesh" },
  { value: "150+", label: "Countries Served" },
  { value: "99.9%", label: "System Uptime" },
];

export default function TeamCulture() {
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
            Our Culture
          </Badge>
          <h2 className="mb-6 text-3xl font-bold sm:text-4xl lg:text-5xl">
            Engineering Principles
          </h2>
          <p className="text-muted-foreground mx-auto max-w-3xl text-xl leading-relaxed">
            The core technical values and architecture standards guiding our platform.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="mx-auto mb-16 grid max-w-4xl grid-cols-2 gap-8 md:grid-cols-4"
        >
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-primary mb-2 text-3xl font-bold">
                {stat.value}
              </div>
              <div className="text-muted-foreground text-sm">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Culture Values */}
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {cultureValues.map((value, index) => (
            <motion.div
              key={index}
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.1 * (index + 1) }}
              viewport={{ once: true }}
            >
              <Card className="bg-card h-full border-0 shadow-md transition-all duration-300 hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="bg-primary/10 mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg">
                    <value.Icon className="text-primary h-6 w-6" />
                  </div>
                  <h4 className="mb-2 text-lg font-semibold">{value.title}</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
