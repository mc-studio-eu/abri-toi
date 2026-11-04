// Limites partagées par les formulaires et leur validation serveur (caractères JS).
export const limitesDemande = {
  email: 254, prenom: 100, nom: 100, organisation: 200, fonction: 150,
  telephone: 40, profil: 200, gamme: 200, codePostal: 20, echeance: 200,
  message: 4000, produit: 200, website: 200,
} as const

export function erreurDemande(error: unknown): string | undefined {
  const response = error as { statusCode?: number; status?: number; data?: { data?: { message?: string } } }
  const status = response?.statusCode ?? response?.status
  if (status === 429) return 'Trop de demandes. Patientez avant de réessayer.'
  if (status === 413) return 'Votre demande est trop volumineuse. Raccourcissez les champs puis réessayez.'
  if (status === 400 || status === 415) return response?.data?.data?.message ?? 'Vérifiez les champs du formulaire puis réessayez.'
}
