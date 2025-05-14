import React , { useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';


function Group(){
  const { id } = useParams();
  return <div>Group ID: {id}</div>;
};

export default Group;

