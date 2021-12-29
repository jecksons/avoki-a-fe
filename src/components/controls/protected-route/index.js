import { Redirect } from "react-router-dom";

export default function ProtectedRoute(props) {
   if (!props.sessionInfo || !props.sessionInfo.id_business) { 
      return <Redirect to="/" />;
   }
   return <props.component match={props.computedMatch} />;
}