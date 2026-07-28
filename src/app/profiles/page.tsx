"use client";

import { useActiveProfile } from "@/components/profile/active-profile-provider";
import { Card } from "@/components/ui/card";
import { PageHeading } from "@/components/ui/page-heading";

export default function ProfilesPage() {
  const { activeProfile } = useActiveProfile();
  return (
    <>
      <PageHeading eyebrow="Profile" title={activeProfile.displayName} description="The foundation for relevant opportunities, application planning and career goals." />
      <div className="grid gap-5 md:grid-cols-2">
        <Card eyebrow="Education" title={activeProfile.university}>
          <p className="text-sm font-semibold">{activeProfile.degree}</p>
          <p className="mt-2 text-sm text-[#68736c]">{activeProfile.discipline} · {activeProfile.studyLevel}</p>
        </Card>
        <Card eyebrow="Location" title={activeProfile.location}>
          <p className="text-sm leading-6 text-[#68736c]">Opportunity preferences and work eligibility details will live here.</p>
        </Card>
        <Card className="md:col-span-2" eyebrow="Current direction" title="Career goals">
          <ul className="flex flex-wrap gap-2">
            {activeProfile.careerGoals.map((goal) => (
              <li key={goal} className="rounded-full bg-[#dce9df] px-3 py-2 text-xs font-bold text-[#245b45]">{goal}</li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}
