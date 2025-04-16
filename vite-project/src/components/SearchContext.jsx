import React, { createContext, useState, useContext } from 'react'; //createContext function allows to create a global context, so we can store and share data across multiple components without passing props manually.

const SearchContext = createContext();    // Creates a global search context

export const useSearch = () => {
  return useContext(SearchContext);   // Custom hook to use context,Navbar.jsx
};

export const SearchProvider = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState(""); // Local state for search

  return (
    <SearchContext.Provider value={{ searchQuery, setSearchQuery }}>   
      {children}                          {/* child components(navbar,search) get access to searchQuery */}
    </SearchContext.Provider>
  );                                       //Provides searchQuery and setSearchQuery to any component that needs it.
};
