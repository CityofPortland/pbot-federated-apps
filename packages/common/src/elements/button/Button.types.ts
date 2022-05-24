export type ButtonColor = 'gray' | 'blue' | 'red' | 'green';
export type ButtonSize = 'small' | 'medium' | 'large';

export interface ButtonProps {
  label: string;
  size?: ButtonSize;
}
