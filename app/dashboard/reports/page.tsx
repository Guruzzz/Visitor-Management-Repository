'use server'

import { notFound } from 'next/navigation'
import { isValidUUID } from '@/lib/utils'
import { VisitorProfileClient } from '@/components/VisitorProfile/VisitorProfileClient'

interface VisitorProfilePageProps {
  params: Promise<{
    visitorId: string
  }>
}

export default async function VisitorProfilePage({
  params,
}: VisitorProfilePageProps) {
  const { visitorId } = await params

  // Server-side validation: Check if visitorId is a valid UUID
  if (!isValidUUID(visitorId)) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <VisitorProfileClient visitorId={visitorId} />
    </div>
  )
}