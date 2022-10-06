import ConnectorForm from "@components/ConnectorForm";
import TextField from "@components/form/TextField";
import ConnectionErrorToast from "@components/toasts/ConnectionErrorToast";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import utils from "~/common/lib/utils";

export default function ConnectCommando() {
  const navigate = useNavigate();
  const { t } = useTranslation("translation", {
    keyPrefix: `choose_connector.commando`,
  });
  const [formData, setFormData] = useState({
    host: "",
    pubkey: "",
    rune: "",
  });
  const [loading, setLoading] = useState(false);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value.trim(),
    });
  }

  function getConnectorType() {
    return "commando";
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const host = formData.host;
    const pubkey = formData.pubkey;
    const rune = formData.rune;
    const account = {
      name: "commando",
      config: {
        host,
        pubkey,
        rune,
      },
      connector: getConnectorType(),
    };

    try {
      let validation;
      // TODO: for native connectors we currently skip the validation because it is too slow (booting up Tor etc.)
      if (account.connector === "nativelndhub") {
        validation = { valid: true, error: "" };
      } else {
        validation = await utils.call("validateAccount", account);
      }

      if (validation.valid) {
        const addResult = await utils.call("addAccount", account);
        if (addResult.accountId) {
          await utils.call("selectAccount", {
            id: addResult.accountId,
          });
          navigate("/test-connection");
        }
      } else {
        console.error(validation);
        toast.error(
          <ConnectionErrorToast message={validation.error as string} />
        );
      }
    } catch (e) {
      console.error(e);
      let message = t("errors.connection_failed");
      if (e instanceof Error) {
        message += `\n\n${e.message}`;
      }
      toast.error(message);
    }
    setLoading(false);
  }

  return (
    <ConnectorForm
      title={t("page.title")}
      description={t("page.description")}
      submitLoading={loading}
      submitDisabled={
        formData.host === "" && formData.pubkey === "" && formData.rune === ""
      }
      onSubmit={handleSubmit}
    >
      <div className="mb-6">
        <TextField
          id="host"
          label={t("host.label")}
          type="text"
          required
          placeholder="host"
          title="host"
          value={formData.host}
          onChange={handleChange}
        />
      </div>
      <div className="mb-6">
        <TextField
          id="pubkey"
          label={t("pubkey.label")}
          type="text"
          required
          placeholder="pubkey"
          title="pubkey"
          value={formData.pubkey}
          onChange={handleChange}
        />
      </div>
      <div className="mb-6">
        <TextField
          id="rune"
          label={t("rune.label")}
          type="text"
          required
          placeholder="rune"
          title="rune"
          value={formData.rune}
          onChange={handleChange}
        />
      </div>
    </ConnectorForm>
  );
}
