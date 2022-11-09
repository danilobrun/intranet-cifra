const editUser = async (req, res) => {

    const { id } = req.params
    const { name, email, password, newPassword } = req.body


    const userData = {
        id,
        name,
        email,
        password,
        newPassword
    }

   

    // Validations
    if (!name) {
        return res.status(422).json({ msg: 'O nome é obrigatório' })
    }

    if (!email) {
        return res.status(422).json({ msg: 'O email é obrigatório' })
    }

    // check if user exists
    const userExists = await User.findOne({ _id: id })

    console.log('log do password: ', password);
    console.log('log do userExistsPass', userExists.password);

    // Check if password match
    const checkPassword = await bcrypt.compare(password, userExists.password, (err, data) => {
    //     console.log('antes do if: ', err);
    //     if (err) {
    //         return res.status(422).json({ msg: 'O email é obrigatório' })
    //     }
    //     if (data) {
    //         console.log('log do data: ', data);
    //     } else {
    //         return res.status(422).json({ msg: 'Usuário não encontrado!'})
    //     }
    // })


    // console.log('log userExists: ', userExists);

    // // Validation pass
    // if (!checkPassword) {
    //     res.status(422).json({ msg: 'Senha inválida!' })
    // }
    
    // if (!userExists) {
    //     return res.status(422).json({ msg: 'Usuário não encontrado!'})
    // }

    // create newPassword
    const salt = await bcrypt.genSalt(12)
    const newPasswordHash = await bcrypt.hash(newPassword, salt)


    try {
        const result = await User.findByIdAndUpdate(userData.id, {
            name,
            email,
            password: newPasswordHash
        }
        // function (err, docs) {
        //     if (err) {
        //         console.log(err);
        //     }
        //     else {
        //         console.log("Updated User : ", docs);
        //     }
        // }
        )
        const userListUpdated = await User.findById(userData.id)
        // console.log('userListUpdated: ', userListUpdated);
        return res.status(200).send(`Usuário atualizado!
        Antigo:
        ${result}
        Atual:
        ${userListUpdated}`)
    } catch (err) {
        console.log(err);
        res.status(500).json({ msg: 'Aconteceu um erro no servidor, tente novamente mais tarde!'})
    }

    // const result = await User.find()
    // return res.status(200).json(result)

}