import { Button } from "@/components/ui/button"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import Link from "next/link"

export const dynamicParams = false

export function generateStaticParams() {
  return [{ slug: 'readme' }, { slug: 'about' }]
}
 
export default async function BlogSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const { default: Post } = await import(`@/content/${slug}.mdx`)
 
  return (<main className="flex-1">
    <div className="w-full h-8" />

    <div className="flex max-w-full flex-row justify-between md:items-start">
      <article className="w-full text-pretty p-2 md:max-w-xl">
        <div >
          <BreadcrumbWithCustomSeparator 
            slug={slug}
            title={slug}
          />
        <div>
            <Post />
          </div>
        </div>


      </article>

  
    </div>
    
  </main>
  )
}

function BreadcrumbWithCustomSeparator({slug, title}: {
  slug: string,
  title: string
}) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/">Home</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/blog">Blog</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href={`/blog/${slug}`}>{title}</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}


