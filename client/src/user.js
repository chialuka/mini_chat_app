import React, { useCallback } from "react";
import Button from "@material-ui/core/Button";

const User = props => {
  const { users, email, name } = props;

  const selectUser = useCallback((mail, user) => {
    props.selectedMail(mail, user);
  });

  const deleteUser = useCallback(() => {
    props.deleteUser(email);
  });

  return (
    <div className="user-welcome" style={props.style}>
      <div className="user-heading">
      <p>Hello, {name}</p>
        <Button
          className="leave"
          size="small"
          variant="outlined"
          onClick={deleteUser}
        >
          Leave Chat?
        </Button>
      </div>
      <div className="select-user">
        {users.map(item =>
          item.email !== email ? (
            <div
              key={item.id}
              className="users"
              onClick={() => selectUser(item.email, item.name)}
            >
              {item.name}
            </div>
          ) : (
            ""
          )
        )}
      </div>
    </div>
  );
};

export default User;
