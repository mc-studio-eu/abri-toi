<script setup lang="ts">
// Rendu du texte d'article (Portable Text de Sanity) : paragraphes, intertitres numérotés,
// listes, encadrés, citations et photos légendées.
interface Span {
  _key?: string
  text: string
  marks?: string[]
}
interface Bloc {
  _type: string
  _key?: string
  style?: string
  listItem?: string
  children?: Span[]
  markDefs?: { _key: string; _type: string; href?: string }[]
  [champ: string]: any
}

const props = defineProps<{ blocs: Bloc[] }>()

// Les puces consécutives sont regroupées dans une même liste ; les intertitres sont numérotés.
const elements = computed(() => {
  const out: (Bloc & { numero?: number; items?: Bloc[] })[] = []
  let numero = 0
  for (const bloc of props.blocs ?? []) {
    if (bloc._type === 'block' && bloc.listItem) {
      const prec = out[out.length - 1]
      if (prec?._type === 'liste') prec.items!.push(bloc)
      else out.push({ _type: 'liste', _key: bloc._key, items: [bloc] })
    } else if (bloc._type === 'block' && bloc.style === 'h2') {
      out.push({ ...bloc, numero: ++numero })
    } else out.push(bloc)
  }
  return out
})

const lien = (bloc: Bloc, span: Span) => {
  const def = bloc.markDefs?.find((d) => span.marks?.includes(d._key) && d._type === 'link')
  return def?.href
}
const texte = (bloc: Bloc) => (bloc.children ?? []).map((s) => s.text).join('')
const numero = (n: number) => String(n).padStart(2, '0')

defineExpose({ intertitres: computed(() => elements.value.filter((e) => e.numero).map((e) => ({ id: `partie-${e.numero}`, titre: texte(e) }))) })
</script>

<template>
  <div class="corps">
    <template v-for="(el, i) in elements" :key="el._key ?? i">
      <h2 v-if="el.numero" :id="`partie-${el.numero}`" class="corps__h2">{{ numero(el.numero) }} — {{ texte(el) }}</h2>
      <p v-else-if="el._type === 'block'" class="corps__p">
        <template v-for="(span, j) in el.children" :key="span._key ?? j">
          <a v-if="lien(el, span)" :href="lien(el, span)" target="_blank" rel="noopener">{{ span.text }}</a>
          <strong v-else-if="span.marks?.includes('strong')">{{ span.text }}</strong>
          <em v-else-if="span.marks?.includes('em')">{{ span.text }}</em>
          <template v-else>{{ span.text }}</template>
        </template>
      </p>
      <ul v-else-if="el._type === 'liste'" class="corps__liste">
        <li v-for="(item, j) in el.items" :key="item._key ?? j">{{ texte(item) }}</li>
      </ul>
      <aside v-else-if="el._type === 'encadre'" class="encadre">
        <p class="label-mono encadre__titre">{{ el.titre }}</p>
        <p class="encadre__texte">{{ el.texte }}</p>
      </aside>
      <blockquote v-else-if="el._type === 'citation'" class="citation">
        <p>{{ el.texte }}</p>
        <footer class="label-mono">{{ el.auteur }}</footer>
      </blockquote>
      <figure v-else-if="el._type === 'imageLegendee'" class="photo">
        <img :src="img(el.image, 1440)" :alt="alt(el.image) || el.legende" loading="lazy" />
        <figcaption class="label-mono">{{ el.legende }}</figcaption>
      </figure>
    </template>
  </div>
</template>

<style scoped>
.corps {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.corps__h2 {
  padding-top: 8px;
  font-family: var(--font-display);
  font-weight: 500;
  font-size: 32px;
  line-height: 1.06;
  letter-spacing: -0.02em;
  scroll-margin-top: 24px;
}

.corps__p,
.corps__liste {
  font-size: 18px;
  line-height: 1.6;
}

.corps__p a {
  color: var(--orange-700);
  text-decoration: underline;
}

.corps__liste {
  padding-left: 22px;
  list-style: disc;
}

.encadre {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 32px;
  border-radius: 16px;
  background: #dde3d3;
}

.encadre__titre {
  color: var(--sage-500);
}

.encadre__texte {
  font-family: var(--font-display);
  font-weight: 500;
  font-size: 22px;
  line-height: 1.4;
}

.citation {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 0;
  padding-left: 28px;
  border-left: 3px solid var(--orange-500);
}

.citation p {
  font-family: var(--font-display);
  font-weight: 500;
  font-size: 28px;
  line-height: 1.15;
  letter-spacing: -0.02em;
}

.photo {
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin: 0;
}

.photo img {
  width: 100%;
  height: 440px;
  border-radius: 16px;
  object-fit: cover;
}

.photo figcaption {
  opacity: 0.6;
}

@media (max-width: 640px) {
  .corps__h2 {
    font-size: 26px;
  }

  .photo img {
    height: 280px;
  }

  .citation p {
    font-size: 22px;
  }
}
</style>
