// Add this inside your component
const hideScrollbarStyle = `
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`;

// Then in your return statement:
return (
  <>
    <style>{hideScrollbarStyle}</style>
    {/* rest of your component */}
  </>
);