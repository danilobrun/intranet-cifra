import { createPortal } from '../../services/Portals.service'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { LayoutPortal } from '../../components/LayoutPortal'
import { UpsertPortalForm } from '../../components/UpsertPortalForm'

export function AdminAddPortalsView () {
    const navigate = useNavigate()
    const handlesubmit = async (formData) => {
        try {
            await createPortal(formData)
            toast.success('Portal cadastrado com sucesso.')
            navigate('/portal/portals')
        } catch {
            toast.error('Falha ao cadastrar portal. Tente novamente.')
        }
    }
    return (
        <LayoutPortal>
            <h1 className='mt-4'>Novo Portal</h1>
            <UpsertPortalForm onSubmit={handlesubmit} />
        </LayoutPortal>
    )
}