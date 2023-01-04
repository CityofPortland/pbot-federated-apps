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

# Color contrast

Maintaining accessible color contrast is important for making information easily readable. To help pick color combinations that are accessible this page will allow you to generate combinations and measure the contrast ratios for those combinations.

<div style="display: flex; gap: .5rem;">
    <label>Color</label>
    <select v-model="color">
        <option v-for="c in Object.keys(colors)" :key="c" :value="c">{{ c }}</option>
    </select>
</div>

<div v-for="stop in stops" style="width: 100%; padding: 1rem;" :style="{'background-color': getStep(colors[color], stop) }">
    <span>{{ getStep(colors[color], stop).hex() }}</span>
    <ul style="display: flex; flex-wrap: wrap; padding: 0;">
        <li v-for="s in stops" style="list-style: none; padding: .5rem; width: 50%" :style="{'background-color': getStep(colors[color], s) }">
            <span v-if="getStep(colors[color], stop).contrast(getStep(colors[color], s)) < 4.5"
            style="padding: .25rem; background-color: red; color: white;">Fail</span>
            <span v-else style="padding: .25rem; background-color: green; color: white;">{{
                getStep(colors[color], stop).contrast(getStep(colors[color], s)) > 7 ? 'AAA' : 'AA'
                }}
            </span>
        </li>
    </ul>
</div>
