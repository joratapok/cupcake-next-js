import Link from "next/link";
import Head from "next/head";

export function MainLayout({children, title = 'Next app'}) {
    return (
        <>
            <Head>
                <title>{title}</title>
        <meta name='keywords' content='next, javascript, react, nextjs'/>
    <meta name='description' content='tutorial for next js'/>
    <meta charSet='utf-8'/>
    </Head>
    <nav>
    <Link href='/'><a>Home</a></Link>
    <Link href='/about'><a>About</a></Link>
    <Link href='/post'><a>Posts</a></Link>
    <Link href='/post/666'><a>Lucky Post</a></Link>
    </nav>
    <main>
    {children}
    </main>
    <style jsx>{`
            nav {
                position: fixed;
                height: 60px;
                top: 0;
                left: 0;
                right: 0;
                background: darkblue;
                display: flex;
                justify-content: space-around;
                align-items: center;
                width: 100%;
            }
            nav a {
                color: white
            }
            main {
                margin: 60px 0 0 0;
                padding: 1rem;
            }
            `}</style>
    </>
)
}
