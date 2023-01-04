<script setup>
import { ref } from 'vue';
import { colors, step } from '../../src/colors';

const color = ref('gray');
const stops = [-4, -3, -2, -1, 0, 1, 2, 3, 4];

const getStep = (color, stop) => {
    let s = 0;

    if (stop < 0) {
        const space = color.lightness();
        s = space / 5;
    }
    else if (stop > 0) {
        const space = 100 - color.lightness();
        s = space / 5;
    }

    return step(color, s, stop);
}
</script>

# Colors

The theme contains all of PBOT's color palette with friendly names given to each color. This page lets you view each of the colors as well as generate different shades for each. Use the select field below to view a color and shades for each. We also have a [contrast tool](contrast) to help determine what color combinations are accessible within each color space.

<div style="display: flex; gap: .5rem;">
    <label>Color</label>
    <select v-model="color">
        <option v-for="c in Object.keys(colors)" :key="c" :value="c">{{ c }}</option>
    </select>
</div>

This is the base color for {{ color }}:

<div style="display: flex; align-items: center">
    <div style="width: 50%; display: flex; flex-direction: column;">
        <span>{{ colors[color].hex() }}</span>
    </div>
    <span style="display: flex; height: 3rem; width: 100%" :style="{ 'background-color': colors[color] }" />
</div>

These are several different shades of {{ color }}:

<div v-for="s in stops" style="display: flex; align-items: center">
    <div style="width: 50%; display: flex; flex-direction: column;">
        <span>{{ getStep(colors[color], s).hex() }}</span>
    </div>
    <span style="display: flex; height: 3rem; width: 100%" :style="{ 'background-color': getStep(colors[color], s) }" />
</div>
