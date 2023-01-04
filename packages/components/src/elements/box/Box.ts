import { defineComponent, h } from 'vue';
import { useBox } from '../../composables/use-box';

export const boxColors = [
  'blue',
  'cyan',
  'gray',
  'green',
  'orange',
  'red',
  'tangerine',
  'transparent',
  'white',
] as const;

export type BoxColor = typeof boxColors[number];

export const boxVariants = ['light', 'neutral', 'dark'] as const;

export type BoxColorVariant = typeof boxVariants[number];

export interface ColorProps {
  color: BoxColor;
  variant: BoxColorVariant;
}

export const BoxProps = {
  as: {
    type: String,
    default: 'div',
  },
  border: {
    type: Boolean,
    default: false,
  },
  color: {
    type: String as () => BoxColor,
    default: 'transparent',
  },
  rounded: {
    type: Boolean,
    default: false,
  },
  shadow: {
    type: Boolean,
    default: false,
  },
  variant: {
    type: String as () => BoxColorVariant,
    default: 'neutral',
  },
};

export default defineComponent({
  props: BoxProps,
  render() {
    const { classes } = useBox(this.border, this.color, this.variant);

    return h(
      this.as,
      {
        class: classes,
      },
      this.$slots.default && this.$slots.default()
    );
  },
});
