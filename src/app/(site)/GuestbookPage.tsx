import { auth } from '@/utils/auth';
import { selectGuestbookEntries } from '@/db/queries';
import { redirect } from 'next/navigation';
import Form from './form';

export const metadata = {
  title: 'Admin',
};

export default async function GuestbookPage() {
  let session = await auth();
  if (session?.user?.email !== process.env.GITHUB_EMAIL) {
    redirect('/');
  }

  let entries = await selectGuestbookEntries();

  return (
    <section>
      <h1 className="font-medium text-2xl mb-8 tracking-tighter">admin</h1>
      <Form entries={entries} />
    </section>
  );
}
