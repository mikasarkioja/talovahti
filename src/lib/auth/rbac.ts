import { prisma } from '@/lib/db'
import { UserRole } from '@prisma/client'

export type ResourceType = 'APARTMENT' | 'READING' | 'TICKET' | 'FINANCE' | 'USER_DATA'

export const RBAC = {
    async canAccess(actorId: string, resourceType: ResourceType, resourceId?: string): Promise<boolean> {
        const user = await prisma.user.findUnique({ where: { id: actorId } })
        if (!user) return false

        if (user.role === 'ADMIN' || user.role === 'MANAGER') return true

        // RESIDENT Logic
        if (user.role === 'RESIDENT') {
            if (resourceType === 'APARTMENT') {
                return user.apartmentId === resourceId
            }
            if (resourceType === 'READING') {
                // Check if meter belongs to user's apartment
                // Simplified: Assume checking against apartmentId provided as resourceId
                return user.apartmentId === resourceId
            }
            if (resourceType === 'USER_DATA') {
                return actorId === resourceId
            }
            // Cannot access FINANCE
            return false
        }

        // BOARD Logic
        if (user.role === 'BOARD') {
            if (resourceType === 'FINANCE') return true
            if (resourceType === 'TICKET') return true // Can see maintenance
            
            // Sensitive Data Check
            if (resourceType === 'USER_DATA') {
                // Board accessing specific user data -> Audit Log required
                // Allow, but application layer must log it.
                // Here we just return true, but typically RBAC is just permission.
                return true 
            }
        }

        return false
    },

    async auditAccess(actorId: string, action: string, target: string, details?: string, ip?: string) {
        // Log sensitive access
        await prisma.gDPRLog.create({
            data: {
                actorId,
                action,
                targetEntity: target,
                details,
                ipAddress: ip
            }
        })
    }
}
