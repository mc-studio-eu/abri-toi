// Pages légales (mentions légales, confidentialité, cookies), reprises de abritoi.com
// et mises à jour pour le nouveau site (formulaire, Sanity, Resend). Texte au format Portable Text.
import type { Bloc } from './articles'

export interface PageLegale {
  slug: string
  titre: string
  chapo?: string
  misAJour: string
  corps: Bloc[]
}

let k = 0
const key = () => `l${++k}`
const bloc = (text: string, style: 'normal' | 'h2', listItem?: 'bullet'): Bloc =>
  ({
    _type: 'block',
    _key: key(),
    style,
    markDefs: [],
    children: [{ _type: 'span', _key: key(), text, marks: [] }],
    ...(listItem ? { listItem, level: 1 } : {}),
  }) as Bloc
const p = (text: string) => bloc(text, 'normal')
const h2 = (text: string) => bloc(text, 'h2')
const li = (...items: string[]) => items.map((t) => bloc(t, 'normal', 'bullet'))

export const pagesLegales: PageLegale[] = [
  {
    slug: 'mentions-legales',
    titre: 'Mentions légales',
    chapo: 'Informations sur l’éditeur et l’hébergeur du site www.abritoi.com.',
    misAJour: '2026-11-05',
    corps: [
      h2('Éditeur du site'),
      p('Le site www.abritoi.com est édité par la société ABRI TOI SAS.'),
      ...li(
        'Forme juridique : société par actions simplifiée (SAS) au capital de 10 000 €',
        'Siège social : 16 rue Fénelon, 69006 Lyon, France',
        'Immatriculation : RCS Lyon 992 306 621',
        'SIRET : 992 306 621 00010',
        'N° de TVA intracommunautaire : FR60992306621',
        'Directeur de la publication : M. Paul Saraceno',
      ),
      h2('Hébergement'),
      p('Le site www.abritoi.com est hébergé par OVH SAS (OVHcloud), 2 rue Kellermann, 59100 Roubaix, France.'),
      p('Les contenus du site sont gérés avec Sanity (Sanity Inc., 1 Letterman Drive, San Francisco, CA 94129, États-Unis).'),
      h2('Contact'),
      ...li('Adresse e-mail : saracenop@abritoi.com', 'Adresse e-mail générale : collaborer@abritoi.com', 'Téléphone : 06 48 20 52 38'),
      h2('Propriété intellectuelle'),
      p(
        'L’ensemble des contenus présents sur le site www.abritoi.com, incluant, de manière non exhaustive, les textes, images, graphismes, logos, icônes, photographies, illustrations et vidéos, est la propriété exclusive d’Abri Toi, sauf mentions contraires.',
      ),
      p(
        'Toute reproduction, représentation, modification, publication, adaptation ou exploitation, totale ou partielle, de ces éléments, par quelque procédé que ce soit et sur quelque support que ce soit, est interdite sans autorisation écrite préalable, conformément aux dispositions du Code de la propriété intellectuelle.',
      ),
      p(
        'L’ensemble des produits et mobiliers présentés sur le site est protégé au titre des dessins et modèles et a fait l’objet de dépôts auprès de l’Institut National de la Propriété Industrielle (INPI).',
      ),
      p('Toute utilisation non autorisée du site ou de l’un des éléments qu’il contient pourra engager la responsabilité civile et/ou pénale de son auteur.'),
      h2('Données personnelles'),
      p(
        'Les informations recueillies via le formulaire de contact et de demande de documentation sont destinées exclusivement à Abri Toi SAS. Leur traitement est détaillé dans notre politique de confidentialité.',
      ),
      h2('Cookies'),
      p('Avec votre accord, le site utilise Google Analytics pour mesurer son audience. Aucun cookie publicitaire n’est activé par cette intégration. Le détail figure dans notre politique de cookies.'),
      h2('Responsabilité'),
      p(
        'L’éditeur du site s’efforce de fournir des informations aussi précises que possible. Toutefois, il ne pourra être tenu responsable des omissions, inexactitudes ou carences dans la mise à jour des informations, qu’elles soient de son fait ou du fait des tiers partenaires.',
      ),
      p('L’utilisateur reconnaît utiliser les informations fournies sous sa responsabilité exclusive.'),
      h2('Droit applicable'),
      p('Les présentes mentions légales sont régies par le droit français. En cas de litige, les tribunaux de Lyon sont seuls compétents.'),
    ],
  },
  {
    slug: 'politique-de-confidentialite',
    titre: 'Politique de confidentialité',
    chapo: 'Comment Abri Toi collecte, utilise et protège les données que vous nous confiez.',
    misAJour: '2026-11-05',
    corps: [
      h2('Responsable du traitement'),
      p(
        'Le responsable du traitement des données personnelles collectées sur www.abritoi.com est ABRI TOI SAS, 16 rue Fénelon, 69006 Lyon, représentée par M. Paul Saraceno.',
      ),
      p('Pour toute question relative à vos données : saracenop@abritoi.com.'),
      h2('Données collectées'),
      p('Nous collectons les données que vous saisissez dans le formulaire de contact ou de demande de documentation :'),
      ...li(
        'identité : prénom, nom, fonction ;',
        'coordonnées : adresse e-mail, téléphone ;',
        'informations sur votre structure et votre projet : collectivité ou organisation, profil, gamme souhaitée, code postal du site, échéance, description du projet, produit consulté.',
      ),
      p('Les champs obligatoires sont signalés par un astérisque. Aucune donnée n’est collectée à votre insu.'),
      h2('Finalités et base légale'),
      p('Vos données sont utilisées pour :'),
      ...li(
        'répondre à votre demande de contact ou de rendez-vous ;',
        'vous envoyer la documentation ou les fiches techniques demandées ;',
        'assurer le suivi de la relation commerciale.',
      ),
      p(
        'Ces traitements reposent sur votre consentement, recueilli dans le formulaire, et sur l’exécution de mesures précontractuelles prises à votre demande.',
      ),
      h2('Destinataires'),
      p('Vos données sont destinées à l’équipe d’Abri Toi. Elles ne sont jamais cédées ni vendues à des tiers.'),
      p('Elles peuvent être traitées, pour notre compte, par des prestataires techniques indispensables au fonctionnement du site :'),
      ...li(
        'OVHcloud (France) : hébergement du site ;',
        'Sanity (États-Unis) : enregistrement des demandes reçues ;',
        'Resend (États-Unis) : acheminement des demandes par e-mail.',
      ),
      p(
        'Lorsque des données sont transférées hors de l’Union européenne, ces transferts sont encadrés par les garanties prévues par le RGPD (clauses contractuelles types de la Commission européenne ou Data Privacy Framework).',
      ),
      h2('Durée de conservation'),
      p(
        'Les données des demandes sont conservées pendant trois ans à compter du dernier échange avec vous, puis supprimées. Les données des clients sont conservées pendant la durée de la relation commerciale, augmentée des durées de prescription légales.',
      ),
      h2('Mesure d’audience'),
      p('Avec votre consentement, Google Analytics reçoit des informations de navigation, notamment les pages consultées et des informations sur votre navigateur et votre appareil, associées à un identifiant de cookie. Ces informations servent à comprendre la fréquentation du site. Google est le prestataire de cette mesure ; les fonctionnalités publicitaires et Google Signals sont désactivés. Vous pouvez refuser ou retirer votre accord via « Gérer les cookies » en pied de page.'),
      h2('Polices de caractères'),
      p(
        'Le site utilise des polices fournies par Google Fonts. Leur chargement transmet votre adresse IP aux serveurs de Google, sans dépôt de cookie.',
      ),
      h2('Vos droits'),
      p(
        'Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique et Libertés, vous disposez d’un droit d’accès, de rectification, d’effacement, de limitation du traitement, d’opposition et de portabilité de vos données. Vous pouvez retirer votre consentement à tout moment.',
      ),
      p('Pour exercer ces droits, écrivez-nous à saracenop@abritoi.com ou à collaborer@abritoi.com.'),
      p(
        'Si vous estimez, après nous avoir contactés, que vos droits ne sont pas respectés, vous pouvez adresser une réclamation à la CNIL (www.cnil.fr).',
      ),
      h2('Sécurité'),
      p(
        'Abri Toi met en œuvre des mesures techniques et organisationnelles adaptées pour protéger vos données contre la perte, l’accès non autorisé ou la divulgation : connexion chiffrée (HTTPS), accès restreint aux seules personnes habilitées.',
      ),
    ],
  },
  {
    slug: 'politique-de-cookies',
    titre: 'Politique de cookies',
    chapo: 'Ce que le site dépose, ou non, sur votre appareil.',
    misAJour: '2026-11-05',
    corps: [
      h2('Qu’est-ce qu’un cookie ?'),
      p(
        'Un cookie est un petit fichier enregistré par votre navigateur lors de la visite d’un site. Il permet de mémoriser des informations sur votre navigation, comme vos préférences ou votre parcours.',
      ),
      h2('Les cookies de ce site'),
      p(
        'Google Analytics (identifiant G-STB0MGR5RF) est chargé uniquement après votre acceptation. Il utilise les cookies _ga et _ga_* pour distinguer les visites et mesurer la fréquentation. Leur durée est configurée à 180 jours et peut être renouvelée lors des visites. Aucun chargement de cette balise n’a lieu avant votre accord ou si vous refusez.',
      ),
      p(
        'Le cookie abritoi-analytics-consent mémorise votre acceptation ou votre refus pendant 180 jours. Il sert uniquement à respecter votre choix. Le bouton « Gérer les cookies » en pied de page permet de modifier ce choix ; le retrait de votre accord supprime les cookies de cette mesure et recharge la page pour arrêter la balise.',
      ),
      h2('Liens vers des sites tiers'),
      p(
        'Le site contient des liens vers LinkedIn et YouTube. Ces plateformes ne déposent des cookies que si vous cliquez sur ces liens et visitez leurs pages ; elles appliquent alors leur propre politique de cookies.',
      ),
      h2('Gérer les cookies dans votre navigateur'),
      p(
        'Vous pouvez à tout moment supprimer les cookies enregistrés ou bloquer leur dépôt depuis les réglages de votre navigateur. La rubrique d’aide de celui-ci explique la marche à suivre.',
      ),
      h2('Évolution de cette politique'),
      p(
        'Cette page sera mise à jour si les outils de mesure d’audience ou les cookies utilisés évoluent.',
      ),
      h2('Contact'),
      p('Pour toute question : Paul Saraceno, ABRI TOI SAS, 16 rue Fénelon, 69006 Lyon, saracenop@abritoi.com.'),
    ],
  },
]
