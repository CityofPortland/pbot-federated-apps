<script setup>
import { ref } from 'vue';
import Box, { boxColors, boxVariants } from '@/elements/box/Box';

const color = ref('blue');
const variant = ref('neutral');
</script>

# Boxes

The Box element is the most generic element in our component library and serves as a basis for many higher level components. It provides very basic coloring properties to ensure that accessibility standards are met no matter what choice is made.

<div class="grid grid-cols-2 gap-4 mb-4">
    <div>
        <label class="block">Color</label>
        <select v-model="color">
            <option v-for="c in boxColors" :key="c" :value="c">{{ c }}</option>
        </select>
    </div>
    <div>
        <label class="block">Variant</label>
        <select v-model="variant">
            <option v-for="v in boxVariants" :key="v" :value="v">{{ v }}</option>
        </select>
    </div>
</div>

<Box :color="color" :variant="variant">This is a box!</Box>

## Variants

Each color theme has three variants associated with it: `light`, `neutral`, and `dark`.

- The default option is `neutral`, and provides a way to draw attention to something typically, but doesn't usually work for longer paragraphs. The `neutral` variant is best used for call to action elements as they draw attention against a white background.
- The `light` variant is useful to maintain a light background and denote the color chosen well, but be useful for longer bits of text inside. Messages should use this `light` variant.
- The `dark` variant is useful with longer strings of text as well when you want to provide an alternative environment or provide a lot of contrast to a section of your application.

<Box :color="color" variant="light">Here's a 'light' box!</Box>
<Box :color="color">Here's a 'neutral' box!</Box>
<Box :color="color" variant="dark">Here's a 'dark' box!</Box>
