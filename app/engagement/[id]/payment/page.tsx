import { PaymentPageClient } from "@/components/payment/payementPageClient";
import { getChallenge } from "@/lib/actions/engagment.actions";
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation";

interface PageProps {
    params: Promise<{
        id: string
    }>
}

export default async function EngagementPayementPage({ params }: PageProps) {

    const { userId } = await auth();

    if (!userId) {
        redirect("/sign-in");
    }

    const { id } = await params;
    const challenge = await getChallenge(id);

   
    return <PaymentPageClient challenge={challenge} />

}