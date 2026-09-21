// Mirrors the API's public user shape (see lunitas_server/src/database/schemas/userSchema.ts
// IPublicUser) — keep both in sync when either changes.
export interface CurrentUser {
    username: string
    name?: string
    role: string
    permissions: string[]
    isFirstLogin: boolean
}
