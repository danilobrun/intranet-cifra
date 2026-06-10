import { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleNotch,
  faSearch,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import {
  AvatarActions,
  AvatarFallback,
  AvatarFeedback,
  AvatarImage,
  AvatarPreview,
  AvatarPreviewColumn,
  AvatarPreviewFrame,
  AvatarSearchButton,
  AvatarSectionGrid,
  AvatarStatusText,
  FieldControl,
  FieldGroup,
  FieldHint,
  FieldLabel,
  FormSection,
  SectionDescription,
  SectionHeader,
  SectionTitle,
} from "./styles";
import {
  getMyAvatar,
  getUserAvatar,
  previewMyAvatar,
  previewUserAvatar,
} from "../../services/Users.service";

const getCpfDigits = (value = "") => String(value).replace(/\D/g, "");

const formatCpf = (value = "") => {
  const digits = getCpfDigits(value).slice(0, 11);

  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  }

  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(
    6,
    9,
  )}-${digits.slice(9)}`;
};

const getInitials = (name = "") => {
  const words = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!words.length) return "";

  return words
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
};

const getCurrentAvatar = (avatarConfig) => {
  if (avatarConfig?.mode === "me") {
    return getMyAvatar();
  }

  return getUserAvatar(avatarConfig.userId);
};

const previewAvatar = (avatarConfig, cpf) => {
  if (avatarConfig?.mode === "me") {
    return previewMyAvatar(cpf);
  }

  return previewUserAvatar(avatarConfig.userId, cpf);
};

export function ProfileAvatarCard({
  avatarConfig,
  userName,
  onDraftCpfChange,
  onPreviewLoadingChange,
  onValidatedCpfChange,
}) {
  const avatarMode = avatarConfig?.mode;
  const avatarUserId = avatarConfig?.userId;
  const [avatarUrl, setAvatarUrl] = useState("");
  const [cpf, setCpf] = useState("");
  const [isLoadingCurrentAvatar, setIsLoadingCurrentAvatar] = useState(false);
  const [isSearchingAvatar, setIsSearchingAvatar] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const initials = useMemo(() => getInitials(userName), [userName]);

  useEffect(() => {
    return () => {
      if (avatarUrl) {
        URL.revokeObjectURL(avatarUrl);
      }
    };
  }, [avatarUrl]);

  useEffect(() => {
    let isActive = true;

    setCpf("");
    setFeedback(null);
    onDraftCpfChange("");
    onValidatedCpfChange("");
    setIsLoadingCurrentAvatar(true);

    const loadCurrentAvatar = async () => {
      try {
        const blob = await getCurrentAvatar({
          mode: avatarMode,
          userId: avatarUserId,
        });

        if (!isActive) return;

        setAvatarUrl(blob ? URL.createObjectURL(blob) : "");
      } catch (error) {
        if (!isActive) return;

        setAvatarUrl("");
        setFeedback({
          type: "error",
          text:
            error.message ||
            "Nao foi possivel carregar a foto de perfil atual.",
        });
      } finally {
        if (isActive) {
          setIsLoadingCurrentAvatar(false);
        }
      }
    };

    loadCurrentAvatar();

    return () => {
      isActive = false;
    };
  }, [
    avatarMode,
    avatarUserId,
    onDraftCpfChange,
    onValidatedCpfChange,
  ]);

  const handleCpfChange = (event) => {
    const formattedCpf = formatCpf(event.target.value);

    setCpf(formattedCpf);
    setFeedback(null);
    onDraftCpfChange(formattedCpf);
    onValidatedCpfChange("");
  };

  const handlePreview = async () => {
    const cpfDigits = getCpfDigits(cpf);

    if (!cpfDigits) {
      setFeedback({
        type: "error",
        text: "Informe um CPF para buscar a foto de perfil.",
      });
      return;
    }

    setIsSearchingAvatar(true);
    onPreviewLoadingChange(true);
    onValidatedCpfChange("");

    try {
      const blob = await previewAvatar(
        {
          mode: avatarMode,
          userId: avatarUserId,
        },
        cpfDigits,
      );

      if (!blob) {
        throw new Error("Nao foi possivel buscar a foto de perfil.");
      }

      setAvatarUrl(URL.createObjectURL(blob));
      onValidatedCpfChange(cpfDigits);
      setFeedback({
        type: "success",
        text: "Foto encontrada. Salve o formulario para confirmar a alteracao.",
      });
    } catch (error) {
      setFeedback({
        type: "error",
        text: error.message || "Nao foi possivel buscar a foto de perfil.",
      });
    } finally {
      setIsSearchingAvatar(false);
      onPreviewLoadingChange(false);
    }
  };

  const isLoadingAvatar = isLoadingCurrentAvatar || isSearchingAvatar;

  return (
    <FormSection>
      <SectionHeader>
        <SectionTitle>Foto de perfil</SectionTitle>
        <SectionDescription>
          Informe o CPF para localizar a foto no sistema interno.
        </SectionDescription>
      </SectionHeader>

      <AvatarSectionGrid>
        <AvatarPreviewColumn>
          <AvatarPreviewFrame>
            <AvatarPreview aria-label="Pre-visualizacao da foto de perfil">
              {avatarUrl ? (
                <AvatarImage src={avatarUrl} alt="Foto de perfil" />
              ) : (
                <AvatarFallback>
                  {initials || <FontAwesomeIcon icon={faUser} />}
                </AvatarFallback>
              )}

              {isLoadingAvatar ? (
                <AvatarStatusText>
                  <FontAwesomeIcon icon={faCircleNotch} spin />
                  Carregando
                </AvatarStatusText>
              ) : null}
            </AvatarPreview>
          </AvatarPreviewFrame>
        </AvatarPreviewColumn>

        <FieldGroup controlId="profile-avatar-cpf">
          <FieldLabel>CPF para foto de perfil</FieldLabel>
          <FieldControl
            type="text"
            inputMode="numeric"
            placeholder="000.000.000-00"
            value={cpf}
            onChange={handleCpfChange}
            autoComplete="off"
          />
          <FieldHint>
            O CPF fica apenas neste formulario ate voce salvar a alteracao.
          </FieldHint>

          <AvatarActions>
            <AvatarSearchButton
              type="button"
              disabled={isSearchingAvatar}
              onClick={handlePreview}
            >
              <FontAwesomeIcon
                icon={isSearchingAvatar ? faCircleNotch : faSearch}
                spin={isSearchingAvatar}
              />
              {isSearchingAvatar ? "Buscando..." : "Buscar foto"}
            </AvatarSearchButton>
          </AvatarActions>

          {feedback ? (
            <AvatarFeedback $type={feedback.type}>{feedback.text}</AvatarFeedback>
          ) : null}
        </FieldGroup>
      </AvatarSectionGrid>
    </FormSection>
  );
}
