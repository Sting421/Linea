const Button = ({ variant, onClick, children, disabled, className = '' }: any) => {
  let newClassName;

  switch (variant) {
    case 'discard':
      newClassName = `flex border-2 px-3 rounded-md items-center min-w-[128px] justify-center py-1 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed ${className}`;
      break;
    case 'outline':
      newClassName = `flex border-blue-500 rounded-md shadow-500 py-1 px-4 min-w-[128px] justify-center disabled:border-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed ${className}`;
      break;
    case 'save':
      newClassName = `rounded-md bg-hue-sky-800 px-3 py-2 text-sm font-sm text-white shadow-sm hover:bg-sky-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 min-w-[128px] disabled:bg-gray-400 disabled:hover:bg-gray-400 disabled:text-gray-100 disabled:cursor-not-allowed ${className}`;
      break;

    case 'big_red':
      newClassName = `rounded-md bg-red-600 px-3 py-2 text-sm font-sm text-white shadow-sm hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 min-w-[128px] disabled:bg-gray-400 disabled:hover:bg-gray-400 disabled:text-gray-100 disabled:cursor-not-allowed ${className}`;
      break;

    default:
      newClassName = `flex px-3 items-center min-w-[128px] justify-center py-1 disabled:bg-gray-200 disabled:cursor-not-allowed`;
  }

  return (
    <button className={newClassName} disabled={disabled} onClick={disabled ? undefined : onClick}>
      {children}
    </button>
  );
};

export default Button;
