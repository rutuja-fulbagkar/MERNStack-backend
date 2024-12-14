// import { useEffect } from 'react';

// const App = () => {
//   useEffect(() => {
//     // Check and apply the theme preference
//     const theme = localStorage.getItem('theme') || 'light';
//     document.body.classList.add(theme);
//   }, []);

//   const handleThemeChange = (theme) => {
//     // Save theme preference
//     localStorage.setItem('theme', theme);
//     document.body.className = ''; // Reset classes
//     document.body.classList.add(theme); // Apply new theme
//   };

//   const saveFormStep = (step) => {
//     // Save form step temporarily
//     sessionStorage.setItem('formStep', step);
//   };

//   const logout = () => {
//     // Remove cookie by expiring it
//     document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC";
//     localStorage.clear(); // Clear all persistent data
//     sessionStorage.clear(); // Clear temporary data
//   };

//   return (
//     <div>
//       <button onClick={() => handleThemeChange('dark')}>Dark Theme</button>
//       <button onClick={() => handleThemeChange('light')}>Light Theme</button>
//       <button onClick={logout}>Logout</button>
//     </div>
//   );
// };

// export default App;
