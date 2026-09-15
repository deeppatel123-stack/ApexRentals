import OrganizationSettings from '../models/OrganizationSettings.js';

export const getSettings = async (req, res, next) => {
  try {
    let settings = await OrganizationSettings.findOne();
    if (!settings) {
      settings = await OrganizationSettings.create({});
    }
    res.status(200).json({ status: 'success', data: { settings } });
  } catch (error) {
    next(error);
  }
};

export const updateSettings = async (req, res, next) => {
  try {
    let settings = await OrganizationSettings.findOne();
    if (!settings) {
      settings = await OrganizationSettings.create(req.body);
    } else {
      settings = await OrganizationSettings.findByIdAndUpdate(settings._id, req.body, {
        new: true,
        runValidators: true,
      });
    }
    res.status(200).json({ status: 'success', message: 'Settings updated successfully.', data: { settings } });
  } catch (error) {
    next(error);
  }
};
