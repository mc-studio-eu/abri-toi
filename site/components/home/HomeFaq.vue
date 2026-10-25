<script setup lang="ts">
// Réponses rédigées à partir des docs commerciales (voir BRIEF.md) ; garanties à relire avec Paul.
const faqs = [
  {
    q: 'Quelle consommation d’eau ? Et en cas d’arrêté sécheresse ?',
    a: 'La brumisation fonctionne à haute pression (70 bars) avec une temporisation pilotée : les périodes de pulvérisation s’adaptent à l’usage de l’espace et la consommation se maîtrise au litre près. Elle peut être coupée en cas de restriction : l’abri continue de fournir de l’ombre. La gamme Fotos récupère jusqu’à 120 L d’eau de pluie. [Consommation horaire à compléter.]',
  },
  {
    q: 'L’eau brumisée est-elle sûre (légionellose) ?',
    a: 'Oui. Galiléo brumise uniquement de l’eau potable issue du réseau, filtrée à 5 microns et traitée aux UV en milieu urbain. Le système est conçu avec notre partenaire BRO Brumisation, spécialiste de la haute pression, et fait l’objet d’une maintenance deux fois par an pour contrôler le circuit et les buses.',
  },
  {
    q: 'Quel entretien prévoir ?',
    a: 'Très peu. La structure en aluminium thermolaqué ne rouille pas, même en bord de mer, et se nettoie simplement à l’eau. L’assise en bois Kebony ne demande aucun traitement et prend une teinte argentée avec le temps. Sur Galiléo, la brumisation est révisée deux fois par an. Sur Fotos, les plantes s’arrosent seules par capillarité grâce au réservoir d’eau de pluie de 120 L ; il suffit de les entretenir comme un massif.',
  },
  {
    q: 'Est-ce compatible avec un marché public ?',
    a: 'Oui. Nous accompagnons les collectivités dans leurs démarches : chaque proposition comprend la configuration, l’implantation en 3D, le chiffrage et les fiches techniques, prêts à être présentés en commission ou en conseil municipal. Les abris sont conçus à Lyon et fabriqués en France par nos partenaires industriels.',
  },
  {
    q: 'Quelle garantie et quelle durée de vie ?',
    a: 'Les abris sont pensés pour durer : structure en aluminium recyclé à 40 % minimum et thermolaqué, assise en bois Kebony classe 4, toiture en tôle d’aluminium perforée. Les conditions et durées de garantie de chaque élément sont précisées dans votre proposition sur-mesure.',
  },
  {
    q: 'Comment l’abri est-il fixé ? Résiste-t-il au vent ?',
    a: 'Cela dépend de la gamme. Galiléo est ancré au sol sur une fondation béton, avec une arrivée d’eau qui passe par le sol. Fotos ne nécessite aucun ancrage : son bac de 1 m³ de terre pèse environ 900 kg et le leste naturellement. Il peut être posé en pleine terre ou rester déplaçable au chariot élévateur. Les caractéristiques de résistance figurent dans les fiches techniques.',
  },
  {
    q: 'Que se passe-t-il en hiver ?',
    a: 'L’abri reste en place et continue d’offrir un lieu où s’asseoir et se retrouver toute l’année. Sur Galiléo, la brumisation est mise à l’arrêt hors de la saison chaude. Sur Fotos, la végétation suit le rythme des saisons et repart au printemps, le réservoir se remplissant avec les pluies.',
  },
  {
    q: 'Quel budget prévoir ?',
    a: 'Le budget dépend de la gamme, du nombre de modules et de votre site (pose, raccordement à l’eau pour Galiléo). Contactez-nous : nous revenons vers vous sous 48 h avec une première orientation, puis un chiffrage détaillé dans la proposition sur-mesure.',
  },
]

const open = ref<number | null>(0)

function toggle(i: number) {
  open.value = open.value === i ? null : i
}
</script>

<template>
  <section class="faq section">
    <div v-reveal class="faq__aside">
      <h2 class="display-h3">Les questions de vos services techniques.</h2>
      <p class="body-m faq__intro">Tout ce qu’il faut pour défendre le projet en interne et en conseil municipal.</p>
      <UiButton />
    </div>

    <ul class="faq__list">
      <li v-for="(item, i) in faqs" :key="item.q" v-reveal="i * 70" class="faq__item" :class="{ 'faq__item--open': open === i }">
        <h3>
          <button
            :id="`faq-q-${i}`"
            class="faq__question"
            :aria-expanded="open === i"
            :aria-controls="`faq-a-${i}`"
            @click="toggle(i)"
          >
            <span class="display-h4">{{ item.q }}</span>
            <span class="faq__icon" aria-hidden="true">{{ open === i ? '–' : '+' }}</span>
          </button>
        </h3>
        <div
          v-show="open === i"
          :id="`faq-a-${i}`"
          class="body-m faq__answer"
          role="region"
          :aria-labelledby="`faq-q-${i}`"
        >
          {{ item.a ?? '[Réponse à compléter.]' }}
        </div>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.faq {
  display: flex;
  align-items: flex-start;
  gap: 96px;
  padding-top: 64px;
  padding-bottom: 120px;
}

.faq__aside {
  flex: 0 0 400px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 24px;
}

.faq__intro {
  max-width: 360px;
  color: var(--brown-700);
}

.faq__list {
  flex: 1 1 0;
  min-width: 0;
  border-top: 1px solid var(--line);
}

.faq__item {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 24px 0;
  border-bottom: 1px solid var(--line);
}

.faq__item h3 {
  font: inherit;
}

.faq__question {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  width: 100%;
  text-align: left;
}

.faq__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: none;
  width: 32px;
  height: 32px;
  border-radius: 999px;
  background: var(--paper);
  font-weight: 500;
  font-size: 16px;
  line-height: 1.3;
  transition: background-color 0.2s;
}

.faq__question:hover .faq__icon,
.faq__item--open .faq__icon {
  background: var(--orange-500);
}

.faq__answer {
  max-width: 640px;
  color: var(--brown-700);
}

@media (max-width: 1024px) {
  .faq {
    flex-direction: column;
    gap: 48px;
  }

  .faq__aside {
    flex-basis: auto;
  }

  .faq__list {
    width: 100%;
  }
}
</style>
