import Head from "next/head";

interface MainLayoutProps {
    children: any
    title: string
}

export function MainLayout({children, title = 'Next app'}: MainLayoutProps) {
    return (
        <>
            <Head>
                <title>{title}</title>
                <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap" />
                <meta name='keywords' content='next, javascript, react, nextjs'/>
                <meta name='description' content='cupcake currencies'/>
                <meta charSet='utf-8'/>
            </Head>

            <main>
                {children}
            </main>

        </>
    )
}
