import { useState } from "react";
import { Button } from "react-bootstrap";
import { useSelector } from "react-redux";
import { createInscriptions } from "../../services/Inscriptions.service";
import { selectUser } from "../../store/User/User.selectors";
import { AuthForm } from "../../components/AuthForm/idenx";
import { toast } from "react-toastify";

export function InscriptionsForm({ portalId, onRegister }) {
  const user = useSelector(selectUser);
  const [isSubmiting, setIsSubmiting] = useState(false);
  const handleInscription = async () => {
    try {
      setIsSubmiting(true);
      await createInscriptions({
        name: user.name,
        email: user.email,
        portalId: portalId,
        userId: user._id,
      });
      toast.success("Inscrito com sucesso.");
      onRegister();
    } catch (err) {
      console.log(err);
      toast.error("Falha ao fazer inscrição. Tente novamente.");
    }
    setIsSubmiting(false);
  };
  return (
    <>
      <h2>Formulário de inscrição</h2>
      {user ? (
        <Button onClick={handleInscription} disabled={isSubmiting}>
          Inscrever
        </Button>
      ) : (
        <>
          <p>
            Faça login ou crie uma conta abaixo para solicitar acesso ao portal.
          </p>
          <AuthForm redirectAfterLogin={false} />
        </>
      )}
    </>
  );
}
