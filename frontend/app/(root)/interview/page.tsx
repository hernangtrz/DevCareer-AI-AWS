export const dynamic = "force-dynamic";

import { getCurrentUser } from "@/lib/api.server";
import InterviewPage from "@/components/InterviewPage";

const Page = async () => {
  const user = await getCurrentUser();

  return <InterviewPage userName={user?.name!} userId={user?.id!} />;
};

export default Page;
