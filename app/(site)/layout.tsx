import { Footer } from "@/lib/ui/blocks/footer";
import { Header } from "@/lib/ui/blocks/header";
import { cn } from "@/lib/utils";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
    return (<div 
        className={
            cn(
                "flex flex-col justify-between items-center", 
                "w-full text-foreground antialiased"
            )
        }
    >
        <div className="w-full max-w-5xl">
            <Header className="w-full"/>
            {children}
        </div>
        <Footer className="w-full border-t border-border bg-background px-4 py-6 my-20 text-sm"/>
    </div>
    );
}