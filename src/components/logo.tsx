import React from 'react';
export function Logo(props: React.PropsWithoutRef<{ color?: string } & React.SVGProps<SVGSVGElement>>) {
  return <svg viewBox="0 0 780 250" {...props}>
    <path fill={props.color || '#231F20'} d="M240,250h100v-50h100V0H240V250z M340,50h50v100h-50V50z M480,0v200h100V50h50v150h50V50h50v150h50V0H480z M0,200h100V50h50v150h50V0H0V200z"></path>
  </svg>
}