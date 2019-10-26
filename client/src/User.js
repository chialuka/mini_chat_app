import React, { useCallback } from "react";
import Button from "@material-ui/core/Button";

const User = props => {
  const { users, email, name, selectedMail, deleteUser } = props;

  const selectUserFunction = useCallback((mail, user) => {
    selectedMail(mail, user);
  }, [selectedMail]);

  const deleteUserFunction = useCallback(() => {
    deleteUser(email);
  }, [deleteUser, email]);

  return (
    <div className="user-welcome" style={props.style}>
      <div className="user-heading">
      <p>Hello, {name}</p>
        <Button
          className="leave"
          size="small"
          variant="outlined"
          onClick={deleteUserFunction}
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
              onClick={() => selectUserFunction(item.email, item.name)}
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
