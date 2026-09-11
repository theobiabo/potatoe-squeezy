import { motion } from "framer-motion";
import DefaultDashboard from "@/layouts/dashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/workspace";
import GeneralGithubUsers from "@/components/pages/explore/general-users";
import PotatoeUsers from "@/components/pages/explore/potatoe-users";

const tabs = [
  { value: "account", label: "Potatoe users", content: <PotatoeUsers /> },
  { value: "general", label: "General", content: <GeneralGithubUsers /> },
];

export default function ExploreUsers() {
  return (
    <DefaultDashboard title="Explore developers">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <PageHeader
          eyebrow="Developer directory"
          title="Find GitHub users"
          description="Search and tip your favorite GitHub contributors."
          className="-mx-4 -mt-6 border-x-0 border-t-0 sm:-mx-6 sm:-mt-8 lg:-mx-8"
        />

        <section aria-label="Developer search">
          <Tabs defaultValue="account" className="flex-col gap-4">
            <TabsList className="h-auto w-full justify-start gap-2 overflow-x-auto border-0 bg-transparent p-0 shadow-none">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="h-auto flex-none bg-transparent px-4 py-2.5 text-content-secondary shadow-none hover:bg-secondary data-[state=active]:border-border data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {tabs.map((tab) => (
              <TabsContent key={tab.value} value={tab.value}>
                {tab.content}
              </TabsContent>
            ))}
          </Tabs>
        </section>
      </motion.div>
    </DefaultDashboard>
  );
}
