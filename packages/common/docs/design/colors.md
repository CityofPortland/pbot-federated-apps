<script setup>
import ColorPalette from './ColorPalette.vue';
</script>

# Color palettes

This project overrides Tailwind's default colors to incorporate the Portland Bureau of Transportation's colors. Each color is displayed below to demonstrate the values available to you when using this Tailwind configuration. Each color is first represented as the 500 weight color with each of the other weights below it to quickly show the palette. Then each weight is shown as a box where the background is set to that color weight. All of the other weights for that color are used on text at 18px, 16px, and 14px with bold weight to show how each looks. Below the text is a badge indicating whether that combination of color, font size and weight pass <a href="https://www.w3.org/TR/WCAG20/">WCAG standards</a> and at what level.

To use a color you would apply a class with the `<property>-<color>-<weight>` pattern. So, to apply blue with a weight of 300 to the background you would use `bg-blue-300`.

## Gray

<ColorPalette color="gray" />
## Fog
<ColorPalette color="fog" />
## Red
<ColorPalette color="red" />
## Tangerine
<ColorPalette color="tangerine" />
## Orange
<ColorPalette color="orange" />
## Marine
<ColorPalette color="marine" />
## Green
<ColorPalette color="green" />
## Cyan
<ColorPalette color="cyan" />
## Blue
<ColorPalette color="blue" />
## Purple
<ColorPalette color="purple" />
