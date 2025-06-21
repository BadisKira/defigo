import { SignIn } from "@clerk/nextjs";

export default function Page() {

    return (<div className="flex mt-28 justify-center h-screen">
        <SignIn />
    </div>)
}