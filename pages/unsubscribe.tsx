import {MainLayout} from "../Components/MainLayout";
import Link from "next/link";

export default function Unsubscribe() {
    return (
        <MainLayout title='unSubscribe Page'>
            <Link  href="/"><a><h2>Back to table</h2></a></Link>
        </MainLayout>
    )
}
