import { FamilyApp } from '@/components/family-app';
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  return <FamilyApp callId={(await params).id} />;
}
