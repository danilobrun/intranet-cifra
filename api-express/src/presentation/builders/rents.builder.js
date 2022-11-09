

const rentsBuilder = (data) => {
    if (data.length === 0) {
        return {}
    }
    const rent = data[0]
    const car = rent.car_selected.length > 0 ? rent.car_selected[0] : null
    const user = rent.user.length > 0 ? rent.user[0] : null
    return {
        _id: rent._id,
        car: car && {
            name: car.name,
            brand: car.brand,
            model: car.model,
            year: car.year,
            transmission: car.transmission,
            engine: car.engine,
            color: car.color,
            door: car.door,
            license_plate: car.license_plate
        },
        user: user && {
            _id: user._id,
            name: user.name,
            email: user.email
        } 


    }
}



module.exports = {
    rentsBuilder
}