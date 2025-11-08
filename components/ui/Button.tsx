
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg backdrop-blur-md border';

  const variantStyles = {
    primary: 'bg-gradient-to-br from-gold/40 to-gold/20 border-white/40 text-white hover:from-gold/50 hover:to-gold/30 hover:shadow-gold/30 focus:ring-gold [&>svg]:stroke-white [&>svg]:stroke-2',
    secondary: 'bg-white/10 border-white/20 text-slate-100 hover:bg-white/20 hover:border-white/30 focus:ring-white/50 [&>svg]:stroke-white [&>svg]:stroke-2',
    danger: 'bg-gradient-to-br from-red-500/40 to-red-600/20 border-white/40 text-white hover:from-red-500/50 hover:to-red-600/30 hover:shadow-red-500/30 focus:ring-red-500 [&>svg]:stroke-white [&>svg]:stroke-2',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3.5 text-base',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
