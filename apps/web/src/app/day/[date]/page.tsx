import { FamilyApp } from '@/components/family-app';
export default async function Page({ params }: { params: Promise<{ date: string }> }) {
  return <FamilyApp date={(await params).date} />;
}
