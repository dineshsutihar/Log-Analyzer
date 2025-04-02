import {atom} from 'recoil'; 

export const activeViewState = atom({
  key: 'activeViewState', 
  default: 'home', 
});

export const userState = atom ({
  
    key:'userState', 
    default: {id: 0, text: "", sender: "user"},
  
})