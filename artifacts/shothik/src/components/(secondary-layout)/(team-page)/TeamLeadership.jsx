import Image from "next/image";
import { team } from "@/_mock/team";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar, Linkedin, Facebook, Mail } from "lucide-react";
import * as motion from "motion/react-client";

export default function TeamLeadership() {
  return (
    <div className="py-16 text-center">
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        viewport={{ once: true }}
        className="mb-12 text-center"
      >
        <Badge variant="outline" className="mb-3 px-3.5 py-1 text-xs tracking-wider uppercase font-semibold">
          LEADERSHIP
        </Badge>
        <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
          Our Leadership Team
        </h2>
        <p className="text-muted-foreground mx-auto max-w-2xl text-base leading-relaxed">
          The core founders, engineers, and advisors driving Shothik AI's mission.
        </p>
      </motion.div>

      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3 justify-items-center">
        {team.map((leader, index) => (
          <motion.div
            key={leader.id}
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.15 * (index + 1) }}
            viewport={{ once: true }}
            className="w-full max-w-[320px]"
          >
            <LeaderCard member={leader} isFirst={index === 0} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function LeaderCard({ member, isFirst }) {
  const { name, designation, image, social = [] } = member;

  const getInitials = (str) => {
    return str
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <Card className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-card/80 p-4 shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-xl">
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-muted/30">
        {image && image !== "/team/placeholder.png" ? (
          <Image
            alt={name}
            src={image}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 320px"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-primary/10 via-muted to-primary/5 text-muted-foreground">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/15 text-primary text-2xl font-bold shadow-inner">
              {getInitials(name)}
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-between pt-5 pb-2 text-center">
        <div>
          <h3 className="text-lg font-bold tracking-tight text-foreground">{name}</h3>
          <p className="mt-1 text-xs font-semibold text-primary/90">{designation}</p>
        </div>

        {isFirst && (
          <div className="mt-4">
            <Button
              asChild
              size="sm"
              className="w-full gap-2 rounded-xl text-xs font-medium shadow-sm"
            >
              <a
                href="https://calendar.google.com/calendar/appointments/schedules/AcZssZ1-0YrraZrcWyTUUrowfsWSDMKPOj57Lt8u9X-NcjC2Oz522EPBGzsD4SjjpkUzwHJOMePNPnbw?gv=true"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Calendar className="h-3.5 w-3.5" />
                Book an Appointment
              </a>
            </Button>
          </div>
        )}

        <div className="mt-4 flex items-center justify-center gap-1.5 border-t border-border/40 pt-3">
          {social[0] && social[0] !== "#" && (
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10" asChild>
              <a href={social[0]} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <Linkedin className="h-4 w-4" />
              </a>
            </Button>
          )}
          {social[1] && social[1] !== "#" && (
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10" asChild>
              <a href={social[1]} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <Facebook className="h-4 w-4" />
              </a>
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10" asChild>
            <a href="mailto:contact@shothikgpt.com" aria-label="Email">
              <Mail className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>
    </Card>
  );
}
