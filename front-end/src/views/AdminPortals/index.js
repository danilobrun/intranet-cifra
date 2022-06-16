import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import { LayoutPortal } from "../../components/LayoutPortal"
import { PortalHeader } from "../../components/PortalHeader"
import { getPortals } from "../../services/Portals.service"
import { Loading } from "../../components/Loading"
import { TablePortals } from "./TablePortals"

export function AdminPortalsView() {
    const [portals, setPortals] = useState([])
    const [loading, setLoading] = useState(true)
    const fecthPortals = async () => {
        try {
            const data = await getPortals()
            setPortals(data)
        } catch {
            toast.error('Falha ao buscar portais. Recarregue a página.')
        }
        setLoading(false)
    }
    useEffect(() => {
        fecthPortals()       
    }, [])
    return (
        <LayoutPortal>
            <PortalHeader
                title='Portais Cadastrados'
                buttonText='Novo portal'
                buttonLink='/portal/portals/cadastro'
            />
            {loading && <Loading /> }
            <TablePortals portals={portals} onDeletePortal={fecthPortals}/>
        </LayoutPortal>
    )
}